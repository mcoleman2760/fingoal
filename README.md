**FinGoal**
FinGoal is a financial goal tracking and savings motivation app.

**.env File Setup**

1. Create the .env file
Inside the fingoal-backend folder, create a file name as .env

2. Add the following variables
MONGO_URI=mongodb+srv://username:password@cluster0.mongodb.net/?appName=Cluster0
JWT_SECRET=<JWT_SECRET=your_jwt_secret_key_here>
PORT=5001

3. Replace placeholders with real values
Replace <username> and <password> with the actual MongoDB Atlas database user credentials.
Replace <your_jwt_secret_key_here> with the team's actual JWT secret key.


## Install & Start
```bash
**Install:**
npm install recharts in fingoal folder
npm install in fingoal-backend folder
npm install in the root folder

**Start**
npm start in the root folder
```

**Features**
* Track income, spending, and savings
* Set and monitor savings goals
* Compare progress with friends
* Upload bank statements for analysis

**Connect Friends Feature**
* Allow users to add or connect with friends within the app
* Enable sharing of savings progress in a secure way
Savings Comparison & Competition
* Display leaderboards where friends can compare savings progress
* Add motivational elements such as challenges, badges, or streaks

**Tech Stack**
* Design: Figma (UI/UX design)
* Frontend: React + CSS
* Backend: Node.js / Express (Flask option under consideration)
* Database: MongoDB
* Data Source: PDF files (with future support for CSV / Plaid API integration)

**Architecture**

**Frontend (React + CSS)**
* Setting financial goals
* Uploading bank statements
* Viewing categorized transactions and charts
* Editing transaction names and categories

**Backend (Express / Node.js)**
* Implementing server-side APIs, authentication, and file uploads
* Categorization: Uploaded statements are analyzed on the server and transactions are auto-categorized using a rule-based approach (Regex/keyword matching). User edits (e.g., renaming Duane Reade → Cosmetics/Beauty) are persisted as custom rules and applied to future uploads
* Savings Recommendations & Storytelling: Computes savings gaps and identifies categories to trim. Generates motivational messages such as “Your savings are 50% accomplished for your Japan trip this summer.”

**Database (MongoDB)**
* Stores user accounts and private data
* Saves financial goals and categorized transactions
* Supports overrides and edits for categories (e.g., AMZN → Amazon)

**Team**
* Maryam Tawfik
* Kyaw Win
* Joonbeom Kim
* Michael Coleman
