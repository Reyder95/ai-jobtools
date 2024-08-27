import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server'
import OpenAI from 'openai';

const systemPrompt = `
You are a cover letter helper. You are to take in customer cover letters, with additional information provided, and "fill in the blanks". 
Fill in everything between brackets such as [] or <>, or anything else that looks like it's a placeholder. Use all the information provided by the user.
This information included but is not limited to: Company name, role name, and additional information associated with the company like what the company does.
Please do not respond additionally to just filling in these placeholders. Please remove the brackets around the placeholders.

For longer placeholder sections, please get a bit creative instead of repeating what was provided.

Please do not change anything outside of what is considered a "placeholder".
`

export async function POST(req: Request) {
    const openai = new OpenAI();
    const data = await req.text();

    const completion = await openai.chat.completions.create({
        messages: [
            {role: "system", content: systemPrompt},
            {role: 'user', content: data}
        ],
        model: 'gpt-4o-mini',
    })

    const response = completion.choices[0].message.content;

    console.log(response)

    return NextResponse.json(response)
}