# Product Requirement Document (PRD): E-Commerce Platform

## 1. Executive Summary
This project aims to build a robust e-commerce platform that demonstrates mastery of authentication, authorization, and process automation. The platform will facilitate interactions between Sellers (Admins) and Buyers, featuring role-specific dashboards, inventory automation, and data reporting capabilities.

## 2. User Roles

### 2.1 Admin/Seller
*   **Primary Goal**: Manage inventory, publish products, and analyze sales.
*   **Key Capabilities**:
    *   Authenticate securely.
    *   Manage product catalog (CRUD).
    *   Control product visibility (Publish/Unpublish).
    *   Receive automated alerts for low inventory.
    *   Export data reports.

### 2.2 Buyer/Customer
*   **Primary Goal**: Browse and purchase products.
*   **Key Capabilities**:
    *   Authenticate securely.
    *   Browse published products.
    *   View personalized buyer dashboard.

## 3. Functional Requirements

### 3.1 Authentication & Authorization
*   **Login/Signup**: Secure registration and login flows for both roles.
*   **Role-Based Access Control (RBAC)**: Middleware/logic to restrict access to specific routes based on user role.
*   **Dynamic Routing**: Upon login, the system detects the user role and redirects to the appropriate dashboard:
    *   Seller -> `/seller/dashboard`
    *   Buyer -> `/buyer/home`

### 3.2 Product Management (Seller Side)
*   **CRUD Operations**: Sellers can add, edit, and delete products.
*   **Publishing Mechanism**:
    *   Each product has a status: `Draft` or `Published`.
    *   Only `Published` products are visible to Buyers.
*   **Inventory Tracking**: Field to track quantity of items in stock.

### 3.3 Inventory Automation
*   **Trigger**: System monitors stock levels after every transaction or update.
*   **Action**: If stock quantity falls below a configurable threshold (e.g., < 10 units), an automated email is sent to the Seller.
*   **Content**: Email contains product name, remaining stock, and a link to restock.

### 3.4 Dashboards & Customization

#### Seller Dashboard
*   **Overview**: Widgets showing total sales, low stock alerts, and recent activity.
*   **Customization**: Sellers can choose which widgets to display on their main dashboard (e.g., toggle "Daily Sales Graph" or "Recent Orders").

#### Buyer Dashboard
*   **Overview**: Featured products, recent purchases, and recommendations.

### 3.5 Reporting & Analytics
*   **Data Points**: Inventory levels, Product Analytics (views/clicks), Sales history.
*   **Export Functionality**:
    *   Button to "Export to CSV".
    *   Generates downloadable `.csv` files for selected datasets (e.g., "inventory_report.csv").

## 4. Technical Stack Recommendation
*   **Frontend**: React.js / Vue.js / Next.js
*   **Backend**: Node.js (Express) / Python (Django/FastAPI)
*   **Database**: PostgreSQL (Relational data suited for inventory/orders)
*   **Auth**: JSON Web Tokens (JWT) or OAuth2
*   **Email Service**: SendGrid / Mailgun / AWS SES

## 5. Success Metrics
*   Successful separation of concerns between Seller and Buyer views.
*   Latency of email delivery for low-stock events < 5 minutes.
*   Accuracy of generated CSV reports.
