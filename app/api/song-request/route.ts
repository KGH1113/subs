import { connectToDB } from "@/lib/mongoose";
import { SongRequestModel } from "@/lib/models/SongRequest";
import { NextRequest, NextResponse } from "next/server";

process.env.TZ = "Asia/Seoul";

interface SongRequestObj {
  name: string;
  studentNumber: string;
  songTitle: string;
  singer: string;
  imgSrc: string;
}

interface BlacklistObj {
  name: string;
  studentNumber: string;
}

interface ValidityObj {
  isValid: boolean;
  message: string;
}

class SongRequest {
  now: Date;
  songRequest: SongRequestObj;
  isValidDB: ValidityObj;
  blkLstDB: BlacklistObj[];
  prevReqsDB: SongRequestObj[];

  constructor(songRequest: SongRequestObj) {
    this.now = new Date();
    this.songRequest = songRequest;
    this.songRequest.studentNumber =
      String(this.now.getFullYear()).slice(2, 4) +
      "s" +
      this.songRequest.studentNumber;
    this.isValidDB = { isValid: false, message: "" };
    this.blkLstDB = [];
    this.prevReqsDB = [];
  }

  async readDB({
    prevReqsDB,
    isValidDB,
    blkLstDB,
  }: {
    prevReqsDB: boolean;
    isValidDB: boolean;
    blkLstDB: boolean;
  }): Promise<void> {
    await connectToDB();

    if (prevReqsDB) {
      const DBData = JSON.parse(
        JSON.stringify(
          await SongRequestModel.findOne({
            date: this.now.toLocaleDateString(),
          })
        )
      );
      if (DBData) {
        this.prevReqsDB = DBData.requests;
      } else {
        this.prevReqsDB = [];
      }
    }

    if (isValidDB) {
      const isValidDBData = JSON.parse(
        JSON.stringify(
          await SongRequestModel.findById("659454a2f2790d57d00ff1fd")
        )
      );
      this.isValidDB = isValidDBData;
    }

    if (blkLstDB) {
      const DBData = await SongRequestModel.findOne({
        date: "blacklist",
      });
      if (DBData) {
        this.blkLstDB = DBData.requests;
      } else {
        this.blkLstDB = [];
      }
    }
  }

  async checkValidity(): Promise<ValidityObj> {
    await this.readDB({
      prevReqsDB: true,
      isValidDB: true,
      blkLstDB: true,
    });

    const strProcess = (str: string) =>
      str
        .toUpperCase()
        .replace(/[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi, "") // replace all special chars to empty char
        .trim()
        .split(" ")
        .join("");

    const { studentNumber, songTitle, singer } = this.songRequest;
    let message: string = "";

    // Check if it is a weekend
    // const dayOfWeek = this.now.getDay();
    // const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 0 represents Sunday, 6 represents Saturday

    // Check if the request limit (10) is over
    const requestCount = this.prevReqsDB.length;
    const isRequestLimitReached = requestCount >= 10;

    // Check if the duplicated song has been already requested
    const isDuplicateSongRequested = this.prevReqsDB.some(
      (req) => strProcess(req.songTitle) === strProcess(songTitle)
    );

    // Check if the requester already requested
    const isRequesterAlreadyRequested = this.prevReqsDB.some(
      (req) => req.studentNumber === studentNumber
    );

    // Check if the requester is in the blacklist
    const isRequesterBlacklisted = this.blkLstDB.some(
      (blacklisted) => blacklisted.studentNumber === studentNumber
    );

    // Check if the duplicated singer has been requested
    const isDuplicateSingerRequested = this.prevReqsDB.some(
      (req) => req.singer === singer
    );

    // Final validation
    // if (isWeekend) {
    //   message = "주말에는 신청을 받지 않습니다.";
    // }

    if (isRequestLimitReached) {
      message = "오늘 신청이 마감되었습니다. (10개)";
    } else if (isDuplicateSongRequested) {
      message = "동일한 신청곡이 존재합니다.";
    } else if (isRequesterAlreadyRequested) {
      message = "이미 신청하셨습니다.";
    } else if (isRequesterBlacklisted) {
      message =
        "블랙리스트에 등록되신 것 같습니다. 최근 신청 시 주의사항을 위반한 적이 있는지 확인해주세요";
    } else if (isDuplicateSingerRequested) {
      message = "동일한 가수의 신청곡이 존재합니다.";
    }

    const isValid: boolean = message === ""; // If error mesage is empty, request is valid

    return { isValid, message };
  }

  async addRequestToDB(): Promise<ValidityObj> {
    await connectToDB();

    const requestValidity = await this.checkValidity();
    if (requestValidity.isValid) {
      await SongRequestModel.findOneAndUpdate(
        { date: this.now.toLocaleDateString() },
        {
          $push: {
            requests: {
              name: this.songRequest.name,
              studentNumber: this.songRequest.studentNumber,
              songTitle: this.songRequest.songTitle,
              singer: this.songRequest.singer,
              imgSrc: this.songRequest.imgSrc,
              timestamp: this.now,
            },
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      return {
        isValid: true,
        message: "",
      };
    } else {
      return { isValid: false, message: requestValidity.message };
    }
  }

  async getRequestFromDB(): Promise<SongRequestObj[]> {
    await connectToDB();
    await this.readDB({
      prevReqsDB: true,
      isValidDB: false,
      blkLstDB: false,
    });
    const result = this.prevReqsDB.map((req: SongRequestObj) => {
      return {
        ...req,
        studentNumber: req.studentNumber.slice(3, 8),
      };
    });
    return result;
  }

  async deleteRequestFromDB(): Promise<ValidityObj> {
    await connectToDB();
    await SongRequestModel.findOneAndUpdate(
      { date: this.now.toLocaleDateString() },
      {
        $pull: {
          requests: {
            name: this.songRequest.name,
            studentNumber: this.songRequest.studentNumber,
          },
        },
      }
    );
    return { isValid: true, message: "" };
  }
}

export async function POST(request: NextRequest) {
  const requestedData: SongRequestObj = await request.json();

  const songReqeust = new SongRequest(requestedData);
  const result = await songReqeust.addRequestToDB();
  return NextResponse.json(result);
}

export async function GET(request: NextRequest) {
  const songReqeust = new SongRequest({
    name: "",
    studentNumber: "",
    songTitle: "",
    singer: "",
    imgSrc: "",
  });
  const result = await songReqeust.getRequestFromDB();
  return NextResponse.json(result);
}

export async function DELETE(request: NextRequest) {
  const requestedData: { name: string; studentNumber: string } =
    await request.json();

  const songRequest = new SongRequest({
    name: requestedData.name,
    studentNumber: requestedData.studentNumber,
    songTitle: "",
    singer: "",
    imgSrc: "",
  });
  const result = await songRequest.deleteRequestFromDB();
  return NextResponse.json(result);
}
