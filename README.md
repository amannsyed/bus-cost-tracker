# 🚌 FareCompare — Bus Cost Tracker

> A sophisticated commuter tool to compare daily **Pay-As-You-Go (PAYG)** bus fare costs against a **monthly subscription pass**, helping you find out exactly when (and if) the subscription pays off.

---

## ✨ Features

- **Daily trip logging** — Record each journey with a fare category and timestamp
- **Weekly PAYG cap** — Automatically applies Arriva-style weekly capping to PAYG costs
- **Subscription tracking** — Log monthly direct debit and admin fee payments
- **Cumulative cost chart** — Visual comparison of PAYG vs. subscription spend over time
- **Break-even detection** — Instantly see the exact date PAYG surpasses your subscription cost
- **Summary dashboard** — At-a-glance stats: total PAYG, total subscription paid, and break-even day
- **Payment ledger** — Full history of subscription payments with add/remove support
- **CSV import & export** — Back up or migrate your trips and payments data
- **Configurable fare categories** — Set custom fare types and prices via the Settings panel
- **Persistent storage** — All data saved locally in `localStorage`; no account needed

---

## 🛠️ Tech Stack

| Technology | Role |
|---|---|
| [React 19](https://react.dev/) + TypeScript | UI framework |
| [Vite 6](https://vite.dev/) | Build tool & dev server |
| [Recharts](https://recharts.org/) | Cumulative cost chart |
| [date-fns](https://date-fns.org/) | Date manipulation |
| [Lucide React](https://lucide.dev/) | Icons |
| [gh-pages](https://github.com/tschaub/gh-pages) | GitHub Pages deployment |

---

## 🚀 Run Locally

**Prerequisites:** [Node.js](https://nodejs.org/) (v18+)

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 📦 Build & Deploy

```bash
# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

---

## 📋 Usage

1. **First launch** — Complete the setup screen with your subscription start date, monthly pass cost, admin fee, and weekly PAYG cap.
2. **Log trips** — Click **Add Entry** to record the fares you paid each day.
3. **Log payments** — Record your monthly direct debit payments in the **Payment Ledger**.
4. **Analyse** — The chart and summary cards update in real time, showing cumulative costs and your break-even point.
5. **Adjust settings** — Use the ⚙️ icon to update your plan details or fare categories at any time.
