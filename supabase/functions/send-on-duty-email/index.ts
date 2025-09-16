import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OnDutyEmailRequest {
  studentName: string;
  email: string;
  collegeName: string;
  eventName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { studentName, email, collegeName, eventName }: OnDutyEmailRequest = await req.json();

    console.log("Sending on-duty email to:", email, "for student:", studentName);

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: left; margin-bottom: 30px;">
          <p><strong>From</strong><br>
          Team AÙRA'2.0,<br>
          Department of Artificial Intelligence and Data Science,<br>
          S.A.Engineering College,<br>
          Thiruverkadu, Chennai-69.</p>
        </div>

        <div style="text-align: left; margin-bottom: 30px;">
          <p><strong>To</strong><br>
          Head of the department,<br>
          ${collegeName},<br>
          India.</p>
        </div>

        <p style="margin-bottom: 20px;"><strong>Respected Sir/Madam,</strong></p>

        <p style="margin-bottom: 20px; text-align: center;"><strong>Subject: Requesting "On-Duty" to participate in our Symposium (AÙRA'2.0) - reg.</strong></p>

        <div style="margin-bottom: 30px; text-indent: 50px; text-align: justify;">
          <p>Your valuable student <strong>${studentName}</strong> is participating in our symposium conducted by AI&DS department symposium (AÙRA'2.0) that will be held at S.A.Engineering College on <strong>26th September 2025</strong>. We request you to grant "On-Duty" for the same. We hope you consider our request and grant them.</p>
        </div>

        <p style="margin-bottom: 10px;"><strong>Thank You</strong></p>

        <div style="margin-top: 30px;">
          <p><strong>Yours Truly,</strong><br>
          Team AÙRA'2.0</p>
        </div>

        <hr style="margin: 40px 0; border: none; border-top: 1px solid #ddd;">
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 30px;">
          <h3 style="color: #2563eb; margin-bottom: 15px;">Event Registration Confirmation</h3>
          <p><strong>Student Name:</strong> ${studentName}</p>
          <p><strong>Event:</strong> ${eventName}</p>
          <p><strong>Institution:</strong> ${collegeName}</p>
          <p><strong>Event Date:</strong> September 26th, 2025</p>
          <p><strong>Venue:</strong> S.A.Engineering College, Thiruverkadu, Chennai-69</p>
        </div>

        <div style="margin-top: 30px; padding: 20px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
          <p style="margin: 0;"><strong>Note:</strong> Please present this email to your department head as an official "On-Duty" request letter for the symposium participation.</p>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Team AÙRA'2.0 <onboarding@resend.dev>",
      to: [email],
      subject: `On-Duty Request for AÙRA'2.0 Symposium - ${studentName}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-on-duty-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);