# 💰 KeuanganKu – Personal Finance App

**KeuanganKu** is a web application designed to help you manage your personal finances effortlessly. With features like transaction recording, debt/receivable tracking, and financial visualization, you can monitor your financial status efficiently.

## ✨ Key Features

- 📊 **Summary Dashboard**: View your financial summary in real-time.
- 🧾 **Transaction Management**: Easily add, edit, and delete transactions.
- 🔁 **Debt/Receivable Tracking**: Record and monitor your debts and receivables.
- 📅 **Filter & Search**: Find transactions by date, category, or description.
- 🌙 **Dark Mode**: Comfortable viewing for nighttime use.
- 📱 **Responsive & PWA**: Access the app from various devices with Progressive Web App support.

## 🚀 Technologies Used

- **Next.js 14** – React framework for modern web applications.
- **TypeScript** – Statically typed programming language.
- **Tailwind CSS** – CSS framework for consistent design.
- **Firebase** – Backend for authentication and data storage.
- **date-fns** – Library for date manipulation.
- **PWA Support** – App installation like native applications.

## 📦 Installation

1. **Clone this repository:**

   ```bash
   git clone https://github.com/alhifnywahid/personal-finance.git
   cd personal-finance
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**

   Create a `.env.local` file and add your Firebase configuration:

   ```env
   NEXT_PUBLIC_FIREBASE_APIKEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTHDOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECTID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGEBUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APPID=your_app_id
   ```

4. **Run the application:**

   ```bash
   npm run dev
   ```

   Access the app at `http://localhost:3000`.

## 🧑‍💻 Contribution

Contributions are welcome! Please fork this repository and create a pull request for improvements or feature additions.

## 📄 License

This project is licensed under the [MIT License](LICENSE).