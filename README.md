
# National Voters’ Service Portal (NVSP) – MERN Stack 

A **full-stack MERN web application** that simulates the core functionality of the official National Voters’ Service Portal managed by the Election Commission of India.
The project enables **citizen-facing voter services** and **administrative workflows** such as registration, verification, approval, and EPIC generation.


## Features

### User Services
*   **New Voter Registration (Form 6)**: Comprehensive form for new voter registration with support for photo and document uploads (Proof of DOB, Proof of Residence).
*   **Track Application Status**: Real-time status tracking of submitted applications using a unique Reference Number.
*   **Search Electoral Roll**: Search for voter details using EPIC (Election Photo Identity Card) Number or Reference Number.
*   **Download e-EPIC**: Verify details and download a digital PDF version of the EPIC card, complete with a QR code.

### Administration (Admin Dashboard)
*   **Secure Login**: Protected admin area with session management.
*   **Application Management**: View list of all applications with advanced filtering (State, District, Assembly Constituency).
*   **Approval Workflow**: Review applicant details and documents, then Accept or Reject applications.
*   **Duplicate Detection**: Intelligent detection of duplicate entries based on demographics to prevent fraud.
*   **EPIC Generation**: Automatic generation of unique EPIC numbers for accepted applications.
*   **Statistics**: Overview of total electors and gender distribution.


## 🧑‍💻 Tech Stack

### Frontend

* **React.js** (Vite)
* **React Router** – Navigation & protected routes
* **HTML2Canvas & jsPDF** – PDF generation
* **QRCode.react** – QR code creation
* **React Hot Toast** – Notifications
* **Vanilla CSS** – Responsive UI

### Backend

* **Node.js & Express.js**
* **MongoDB & Mongoose** – Database & schema modeling
* **Multer** – File uploads (images & documents)


## Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v14+ recommended)
*   [MongoDB](https://www.mongodb.com/) (Local service or Atlas cluster)

### 1. Server Setup

Navigate to the `server` directory and install dependencies:

```bash
cd server
npm install
```

**Environment Variables:**
Create a `.env` file in the `server` directory (optional, defaults are included in code):
```env
MONGO_URI=mongodb://127.0.0.1:27017/nvsp
ECI_API_BASE='YOUR_API_KEY_FROM_ECI'
```

Start the backend server:
```bash
node server.js
```
The server will run on `http://localhost:5000`.

### 2. Client Setup

Navigate to the `client` directory and install dependencies:

```bash
cd client
npm install
```

**Environment Variables:**
Create a `.env` file in the `client` directory:
```env
VITE_API_BASE=http://localhost:5000
```

Start the frontend development server:
```bash
npm run dev
```
Access the application at `http://localhost:5173` (or the port shown in your terminal).


## 🔮 Future Enhancements

* **Form 7** – Deletion of name from Electoral Roll
* **Form 8** – Correction of entries in Electoral Roll
* **Special Intensive Revision (SIR)** forms
* **Download Electoral Roll (PDF)**
* **Contact Election Officials module**
* **Role-based Admin Access (ERO / BLO / DEO)**
* **OTP / Aadhaar-based verification (mocked)**

---


