import { connectToDB } from "@/lib/mongoose";
import SuggestionRequestModel from "@/lib/models/SuggestionRequest";
import { NextRequest, NextResponse } from "next/server";

interface SuggestionRequest {
  name: string;
  studentNumber: string;
  suggestion: string;
  answer: string;
}

interface BlacklistItem {
  name: string;
  studentNumber: string;
}

interface Validity {
  isValid: boolean;
  message: string;
}

async function addSuggestion(
  { name, studentNumber, suggestion }: SuggestionRequest,
  requestedTime: Date
): Promise<Validity> {
  await connectToDB();
  const blacklist: { requests: BlacklistItem[] } =
    (await SuggestionRequestModel.findById("65904732bccbf9ea338d017d")) as {
      requests: BlacklistItem[];
    };
  const blklistStudentNumbers: string[] = blacklist.requests.map(
    (e: BlacklistItem) => e.studentNumber
  );
  console.log(blklistStudentNumbers);
  if (blklistStudentNumbers.includes(studentNumber)) {
    return {
      isValid: false,
      message:
        "블랙리스트에 등록되신 것 같습니다. 최근 신청 시 주의사항을 위반한 적이 있는지 확인해주세요",
    };
  } else {
    await SuggestionRequestModel.findByIdAndUpdate(
      "659044a7bccbf9ea338d017c",
      {
        $push: {
          requests: {
            name: name,
            studentNumber: studentNumber,
            suggestion: suggestion,
            answer: "",
            timestamp: requestedTime,
          },
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return { isValid: true, message: "건의사항이 성공적으로 신청되었습니다." };
  }
}

async function getSuggestion(): Promise<SuggestionRequest[]> {
  await connectToDB();
  const requests: { requests: SuggestionRequest[] } =
    (await SuggestionRequestModel.findById("659044a7bccbf9ea338d017c")) as {
      requests: SuggestionRequest[];
    };

  return requests.requests;
}

export async function POST(request: NextRequest) {
  const requestedTime = request.nextUrl.searchParams.get("date");
  const requestedData: SuggestionRequest = await request.json();
  const result = await addSuggestion(
    requestedData,
    new Date(Number(requestedTime))
  );
  return NextResponse.json(result);
}

export async function GET() {
  const data = await getSuggestion();
  return NextResponse.json(data);
}
