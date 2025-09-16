# 📢 Current Features and Upcoming Updates

This notice is meant to help you understand what you can do today, why certain choices were made, and where we're headed.

---

## ✅ Current Features

### 🔗 Jira Integration
1. You can seamlessly connect your **Atlassian Jira account** through the **Integrations** page.  
2. Once connected, you can access all your existing Jira projects in the **Projects** page.  
3. Any Jira project can be linked to this app with just a single click on the **Connect** button.

👉 **Note:** We intentionally did **not** provide the ability to create new Jira projects from within this app.

- Jira project creation is considered an internal team responsibility and to be done directly on Jira.
- This app's scope is focused strictly on **requirements, test cases, and datasets**—not on creating or managing Jira projects.

---

### 🤖 Captain (The In-App Assistant)

4. You can also ask **Captain** itself to perform many tasks for you, such as:  

    - Connecting your Jira account  
    - Connecting a Jira project to this application  
    - Deleting a requirement or test case  
    - Creating datasets

---

### 👥 Project Access
5. Multiple team members can work on the same project in this app, as long as they already have the proper access in Jira.  

---

### 📄 Documentation and Requirement Processing
6. You can upload your project's documentation in the **Project Details** page.  
    - Supported formats (for now, will expand to XML, Plain Text and Markdown in the future): **PDF, Word, Excel, CSV**.  
    - Uploading documentation will automatically trigger **requirement and test case generation**.

7. To ensure quality, we made **manual verification mandatory**:

    - You must confirm generated requirements and remove any that are unnecessary before testcases are generated for these requirements.  
    - Similarly, you must review test cases and remove any that are unnecessary before they are created on Jira.  

---

### 🧪 Test Case Lifecycle
8. Once confirmed, test cases are automatically created in Jira.

9. For convenience, this app syncs those testcases right after creation:

    - After creation, they are synced back into this app.  
    - Each synced test case provides an **“Open in Jira”** option for direct navigation.  

---

### 📊 Dataset Management
10. Datasets are generated for all confirmed test cases.

    - Trigger dataset creation with the **Create Datasets** button.  
    - You can download datasets either **individually** (per test case) or **in bulk** (for all test cases).  

---

### 🖥️ User Experience Enhancements
11. A **realtime progress banner** is displayed at the top of the **Project Details** page so you can track the current status.

12. Each project will have a **version**.

    - This is preparation for future **versioning support**, so you can later create new test cases when requirements evolve, without losing historical context.

---

## 🚀 Future Updates on Our Roadmap

### 📌 Support for Changing Project Requirements
- As your project requirements change and new features get added and older ones get deprecated, you will be able to create a **new version** of the project in the app.

- Instead of regenerating all test cases from scratch, the app will:

    - Compare new requirements with existing test cases.  
    - Reuse what already exists.  
    - Generate only what's truly new or changed.

- Only the **latest version** will allow actions. Older versions will become **read-only**.  

---

### 🔀 Upload Existing Testcases
- You will be able to upload existing testcases, into this app and then generate only the missed test cases.

---

### ✨ Enhancement of Testcases
- You will be able to chat with AI and enhance a testcase it generated, if it is not upto the mark.

---

### 🔄 Realtime Jira Sync
- Any changes you make to test cases in Jira (outside the app) will sync back automatically into this app.

---

### 📂 Expanded Documentation Support
- Current supported formats: PDF, Word, Excel, CSV.
- Planned future support: **Plain Text**, **Markdown** and **XML**.  

---

### 🛠️ More Tool Integrations
- Right now, only Jira is supported.  
- Planned future integrations: **Azure DevOps** and **Polarion**.  

---

### 🔐 Authentication
- At this time, only **Google authentication** is supported. More authentication options will be added in the future.  

---

## Summary 
You'll see smarter versioning, support for already created test cases, realtime sync, and expanded integrations in the near future.

Stay tuned 🚀.