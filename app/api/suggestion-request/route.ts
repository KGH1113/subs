import { connectToDB } from "@/lib/mongoose";
import { SuggestionRequestModel } from "@/lib/models/SuggestionRequest";
import { NextRequest, NextResponse } from "next/server";
import { isValid } from "zod";

process.env.TZ = "Asia/Seoul";

interface SgstnRequestObj {
  name: string;
  studentNumber: string;
  suggestion: string;
  answer: string;
}

interface BlacklistObj {
  name: string;
  studentNumber: string;
}

interface ValidityObj {
  isValid: boolean;
  message: string;
}

class SuggestionRequest {
  now: Date;
  suggestionRequest: SgstnRequestObj;
  blkLstDB: BlacklistObj[];
  prevReqsDB: SgstnRequestObj[];

  constructor(suggestionRequest: SgstnRequestObj) {
    this.now = new Date();
    this.suggestionRequest = suggestionRequest;
    this.suggestionRequest.studentNumber =
      String(this.now.getFullYear()).slice(2, 4) +
      "s" +
      this.suggestionRequest.studentNumber;
    this.blkLstDB = [];
    this.prevReqsDB = [];
  }

  async readDB({
    prevReqsDB,
    blkLstDB,
  }: {
    prevReqsDB: boolean;
    blkLstDB: boolean;
  }): Promise<void> {
    await connectToDB();

    if (prevReqsDB) {
      const DBData = await SuggestionRequestModel.findById(
        "659044a7bccbf9ea338d017c"
      );
      if (DBData) {
        this.prevReqsDB = DBData.requests;
      } else {
        this.prevReqsDB = [];
      }
    }
    if (blkLstDB) {
      const DBData = await SuggestionRequestModel.findById(
        "65904732bccbf9ea338d017d"
      );
      if (DBData) {
        this.blkLstDB = DBData.requests;
      } else {
        this.blkLstDB = [];
      }
    }
  }

  async checkValidity(): Promise<ValidityObj> {
    await this.readDB({ blkLstDB: true, prevReqsDB: false });

    const { studentNumber } = this.suggestionRequest;
    let message: string = "";

    // Check if the requester is in the blacklist
    const isRequesterBlacklisted = this.blkLstDB.some(
      (blacklisted) => blacklisted.studentNumber === studentNumber
    );

    if (isRequesterBlacklisted) {
      message =
        "블랙리스트에 등록되신 것 같습니다. 최근 신청 시 주의사항을 위반한 적이 있는지 확인해주세요";
    }

    const isValid: boolean = message === ""; // If error mesage is empty, request is valid

    return { isValid, message };
  }

  async addSuggestionToDB(): Promise<ValidityObj> {
    await connectToDB();

    const requestValidity = await this.checkValidity();
    if (requestValidity.isValid) {
      await SuggestionRequestModel.findByIdAndUpdate(
        "659044a7bccbf9ea338d017c",
        {
          $push: {
            requests: {
              name: this.suggestionRequest.name,
              studentNumber: this.suggestionRequest.studentNumber,
              suggestion: this.suggestionRequest.suggestion,
              answer: "",
              timestamp: this.now,
            },
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      return {
        isValid: true,
        message: "건의사항이 성공적으로 신청되었습니다.",
      };
    } else {
      return { isValid: false, message: requestValidity.message };
    }
  }

  async getSuggestionFromDB(): Promise<SgstnRequestObj[]> {
    await connectToDB();
    await this.readDB({ blkLstDB: false, prevReqsDB: true });
    return this.prevReqsDB;
  }
}

export async function POST(request: NextRequest) {
  const requestedData: SgstnRequestObj = await request.json();

  const suggestionRequest = new SuggestionRequest(requestedData);
  const result = await suggestionRequest.addSuggestionToDB();
  return NextResponse.json(result);
}

export async function GET() {
  const suggestionRequest = new SuggestionRequest({
    name: "",
    studentNumber: "",
    suggestion: "",
    answer: "",
  });
  const result = await suggestionRequest.getSuggestionFromDB();
  return NextResponse.json(result);
}
