import { connectToDB } from "@/lib/mongoose";
import ApplicationModel from "@/lib/models/Application";
import { NextRequest, NextResponse } from "next/server";

interface Application {
  name: string;
  studentNumber: string;
  applicationFileURL: string;
  fileType: string;
}

interface Validity {
  isValid: boolean;
  message: string;
}

async function addFileInfoToDB(
  { name, studentNumber, applicationFileURL, fileType }: Application,
  requestedTime: Date
): Promise<Validity> {
  await connectToDB();
  const isValidDoc = JSON.parse(
    JSON.stringify(await ApplicationModel.findById("65e5a2deabca692f1f9590f9"))
  );
  if (!isValidDoc.isValid) {
    return { isValid: false, message: isValidDoc.message };
  }
  await ApplicationModel.findByIdAndUpdate(
    "65e5b27aabca692f1f9590fa",
    {
      $push: {
        applications: {
          name: name,
          studentNumber: studentNumber,
          applicationFileURL: applicationFileURL,
          fileType: fileType,
          timestamp: requestedTime,
        },
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return { isValid: true, message: "" };
}

export async function POST(request: NextRequest) {
  const requestedTime = request.nextUrl.searchParams.get("date");
  const requestedData: Application = await request.json();
  const result = await addFileInfoToDB(
    requestedData,
    new Date(Number(requestedTime))
  );
  return NextResponse.json(result);
}
