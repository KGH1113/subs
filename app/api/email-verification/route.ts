import { NextRequest, NextResponse } from "next/server";
const nodemailer = require("nodemailer");
process.env.TZ = "Asia/Seoul";

const EMAIL = process.env.EMAIL;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

if (!EMAIL || !EMAIL_PASSWORD) {
  console.log("Email info is invalid.");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL,
    pass: EMAIL_PASSWORD,
  },
});

async function sendVerificationEmail(code: string, emailAddrTo: string) {
  const mailOptions = {
    from: process.env.EMAIL,
    to: emailAddrTo,
    subject: "서운중학교 방송부 웹사이트 본인인증 코드",
    text: `안녕하세요, 서운중학교 방송부입니다.\n신청자님의 인증 코드는 다음과 같습니다:\n${code}`,
  };

  await transporter.sendMail(mailOptions, function (error: any, info: any) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

function generateRandomCode() {
  let code: string = "";
  for (let i = 0; i < 6; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
}

// 방송부 후배야 보고있니? 보안 겁나 허술하니까 알아서 강화하도록 해!
export async function POST(request: NextRequest) {
  const { emailAddr } = await request.json();
  const randomCode = generateRandomCode();
  await sendVerificationEmail(randomCode, emailAddr);
  return NextResponse.json({ code: randomCode });
}
