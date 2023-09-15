# About this project

Started 9/11/2023 by [Jim Carnicelli](https://jimcarnicelli.com) as an assignment from [Solace, Inc](https://www.solace.health/) as part of an application for the *Senior Full Stack Software Engineer* opening. See below for the exact [Assignment definition](#assignment).

**[See a live demo ▶](http://jimcarnicelli.com:88/)**


# Configuring your dev environment

1. Clone project to local dev machine
2. Create empty Postgres database
3. Copy .env file to .env.local and edit Postgres DB settings
4. npm run dev
5. Visit http://localhost:88/
6. Click http://localhost:88/migrations to populate empty database
7. Ready to go with http://localhost:88/client


# Assignment

**Background**: Solace wants to see how you develop code and deliver a small project that would be similar to your day-to-day work at Solace. The app built here will flex both your backend and frontend skill sets.

Solace has a feature that allows advocates to create notes on both their individual client appointments and contract work they perform for the client. A simple feature that has proven very valuable for advocates to solidify all their information inside one application that they can then share with their clients as they see fit. We want you to build the first iteration of what that feature was for Solace.

**Goal**: The deliverable out of this is a link to a Github repo, whatever documentation you might think would be helpful and a working web app hosted somewhere publicly accessible.

Please build a very simple “Notes” Web App. An app that will allow a user to Index, Create, Update and Delete notes.

Our main goal is to see how you put the pieces together, so feel free to be creative and have fun with it. Please ensure that you cover all of the acceptance criteria mentioned below but be sure to add your own spin on it and if you have to make tradeoffs in any area, that’s fine, just mention what and why in your documentation. Technical framework decisions are up to you (so long as they are in the JS/TS family), if you want this to be a NestJS and React app, great! If you want it to be a NextJS app, also great! If you want to do another framework or a hybrid, also great!

## Acceptance Criteria:

* Must be written with JavaScript or Typescript (preferred)
* Note Form must have the following validations
    * Must not be shorter then 20 characters
    * Must not be longer then 300 characters
* Main page must include all the notes and a way to create a new note
* Main page must include a search bar that will find based on a notes content. (Client or Server query is fine)
* Must include README with steps on how to run the application(s) locally.


# Design considerations

## Business model

Solace's business model appears to follow a marketplace middleman model. Solace's clients gain free access to a wide variety of healthcare "advocates". Advocates are typically healthcare providers interested in providing paid services to clients. They use Solace's marketplace to find them. Solace expects communications and payments to flow through their platform. And they take a cut of payments as a service fee. See their [FAQ](https://www.solace.health/faq) for a client-oriented summary of their basic model.

## Interpretation of assignment

Advocates are encouraged to keep probably dated, journal style notes on their interactions with their clients. Probably to document their understanding of what clients want and to record some of their private provider notes and observations and recommendations they opt to share with their clients. This probably also helps indemnify them from litigation later by documenting expectations and outcomes.

The assignment description appears to indicate that they want a simplistic prototype of a portal website for advocates to manage these notes. The scope appears to exclude a detailed look at client management. So I'll create a very simplified data structure to represent advocates, clients, advocate-client connections ("contracts"), and interactions over time as a basis. I'll add a single demo advocate so there's no need for setup, logins, and other account management. That will allow me to focus more on the interactions and notes.

I'll assume without explicit implementation that an advocate is part of a team and that the team's administrator(s) have rights to view the advocate's notes and other portal data. I'll only allow the advocate a boolean flag to indicate whether a note is shared with the client or not.

## Technical implementation decisions

Given the limited scope of this simple project I want to favor technologies I am already familiar with rather than take the time to adopt and gain proficiency with technologies used by Solace. Knowing that I can ramp up to them quickly if hired. Some seem simple enough to learn and implement though.

Solace's job posting emphasizes the use of Typescript. No problem. I have not used Nest.js, a stated standard for Solace. It appears to have a similar goal but slightly different approach to server-oriented web apps from Next.js. I'll go wtih Next.js because of my strong experience with it. Postgres will be a fine database choice. I have not used TypeORM or SWR previously. I'll skip them in the name of development speed here. To keep development client-side development simple I'll skip using Redux.

For the sake of shortening the development cycle I'll bring in some existing libraries I've made for other Next.js projects. Like my database and client/server API interface.

## Development cycle

My initial estimate is that it will take me about three developer days to craft this prototype solution.


# Delivery notes

Delivered 9/15/2023. It took about 3 ten-hour days to craft this demo. Then a portion of Friday to deploy to production and update this document. My primary goal was to demonstrate my ability to deliver something functional fairly quickly. It was a little agonizing to refrain from refining many things I wanted to. For one thing, I had intended to stylize this to better fit Solace's public branding. I opted to just keep most of the default styles of the project I drew from.

Most of the framework for this project came from my recent [snugglehamster.com](https://snugglehamster.com) project.
I might well have finished this sooner. But I did get sidetracked by a desire to use Next.js's very new app router (versus its traditional page router). This added a few hours to my work. But it was already on my to-do list to ramp up to.

I was also sidetracked by a desire at first to employ TypeORM since this is apparently part of Solace's tech stack. I assumed it would take little time to familiarize myself with and employ it. After a little time playing with it I determined that the learning curve was a little steeper than I expected. I decided to go with the simpler home-spun ORM I built for my prior project. I was also a little sidetracked by a desire to build a more sophisticated database migration up/down mechanism to speed my development. Fun diversion.

I wanted to show a certain well-roundedness that I try to bring to my UIs. I like providing more than one way to do the same thing. So in this demo I emphasized the ease of finding and managing notes. The My clients page presents both a list of the clients you have interacted with ever and all encounter-notes presented in order of recency, as though a journal of your work. You can easily filter clients by name or filter notes by client name, encounter summary, or note message text. And you can drill down to the individual client to get a narrower view of your encounters with and notes for that client. You can click on the encounter to filters the notes below by that encounter. Note that clicking a second time on the selected encounter deselects it and thus unfilters the notes again.

Note that the text filters are terms based, not just for phrases. For example, "amy ail" will work just fine to find Ailment Amy. And "bill something what" will match a note based on matching the client's name, the subject of the encounter, and the note's text. You can put a term in quotes if you want a phrase match.

I also wanted to show some of my approach to dealing with database design. I know the scope of this demo project is narrow. But I'm used to the familiar pattern in healthcare management systems of medical record (patient) plus encounter (event) plus order (labs, procedures, etc). So I built this around user (client) plus encounter plus note. With notes having various types. I didn't flesh out the use of direct messages. I opted to just focus on creating notes. But I was picturing the use of this as a simple messaging system and not just for private notes. And I made it so the advocate can opt to share their notes with their clients or keep them private. I was taking for granted that clients could do the same. Naturally I did not build a UI for clients. That's a nontrivial task well outsided the scope of this demo.

There are many things I would like to have done. But hopefully this shows I have a decent balance of skills, talent, and practicality.
