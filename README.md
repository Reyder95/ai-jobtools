# AI Job Tools by Konstantinos Houtas
## Introduction
As a software engineer currently in the market, I have decided to develop an application to help me (and potentially others) in generating cover letters to help speed up the job search.

Currently only supports cover letter generation, but with potentially more features down the line

## Features
- Cover Letter Generation

    - Insert a prompt with "placeholders" such as [placeholder here].
    - Provide a company name, and a role
    - Provide additional information about the company
    - Both PDF and DOCX download support

- Profiles (coming soon)
    - Ability to save generated cover letters to your profile
    - Ability to save prescripts and postscripts to your profile, for instantly placing in your cover letters
    - Ability to add and save skills, for the AI to use in cover letter generations

## How to clone and run
This unfortunately is not free... but it's quite cheap. Please go [here](https://platform.openai.com/docs/overview) to get yourself an API key. You can view pricing as well. By default, this uses gpt-4o-mini for cheap costs for personal use.

Clone the project as normal `git clone https://github.com/Reyder95/ai-jobtools.git`.

cd into the project `cd ai-jobtools`

Type `npm install` to install all the required dependencies

Create a file in the root folder called .env.local and add the following line
`OPENAI_API_KEY=YOUR_API_KEY` Replace `YOUR_API_KEY` with the API key you received in the openai platform.

Type `npm run dev` in the root location to run the project.

To check if the project is working, go to `localhost:3000` in your browser.

The project should now be working! If you have any issues running the application this way, please use the `Issues` section and post the problems!

Thank you!
