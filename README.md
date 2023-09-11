# About this project

Started 9/11/2023 by [Jim Carnicelli](https://jimcarnicelli.com) as an assignment from [Solace, Inc](https://www.solace.health/) as part of an application for the *Senior Full Stack Software Engineer* opening. See below for the exact [Assignement definition](#assignment).

**[See a live demo ▶](https://jimcarnicelli.com/)**


# Configuring your dev environment

Coming soon ...


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

The assignment description appears to indicate that they want a simplistic prototype of a portal website for advocates to manage these notes. The scope appears to exclude a detailed look at client management. So I'll create a very simplified data structure to represent advocates, clients, advocate-client connections ("contracts"), and interactions over time as a basis. I'll add a single demo advocate so there's no need for setup, logins, and other account management. I'll also create a simple mechanism for the demo user to create contract records that serve to also define fictional clients in a trivial way. That will allow me to focus more on the interactions and notes.

I'll assume without explicit implementation that an advocate is part of a team and that the team's administrator(s) have rights to view the advocate's notes and other portal data. I'll only allow the advocate a boolean flag to indicate whether a note is shared with the client or not.

## Technical implementation decisions

Given the limited scope of this simple project I want to favor technologies I am already familiar with rather than take the time to adopt and gain proficiency with technologies used by Solace. Knowing that I can ramp up to them quickly if hired. Some seem simple enough to learn and implement though.

Solace's job posting emphasizes the use of Typescript. No problem. I have not used Nest.js, a stated standard for Solace. It appears to have a similar goal but slightly different appraoch to server-oriented web apps from Next.js. I'll go wtih Next.js because of my strong experience with it. I have not used TypeORM or SWR previously. But both seem easy enough to learn. So I'll employ them here. Postgres will be a fine database choice. To keep development client-side development simple I'll skip using Redux.

## Development cycle

My initial estimate is that it will take me about three developer days to craft this prototype solution.

