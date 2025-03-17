import OpenAI from "openai";
import dotenv from 'dotenv';
dotenv.config();


export const ask =async(req,res)=>{
    const openai = new OpenAI({
        apiKey: process.env.API_AI,
      });
      
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: "write a haiku about AI" }],
        });
    
        res.status(200).json({ data: completion.choices[0].message });
      } catch (error) {
        console.error("OpenAI API Error:", error);
        res.status(500).json({ error: "Failed to fetch response from OpenAI API" });
      }
}