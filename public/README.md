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

### 📄 Documentation and Requirement Processing
1. You can upload your project's documentation in the **Project Details** page.

    - Supported formats (for now, will expand to XML, Plain Text and Markdown in the future): **PDF, Word, Excel, CSV**.  
    - Uploading documentation will automatically trigger **requirement and test case generation**.

2. To ensure quality, we made **manual verification mandatory**:

    - You must confirm generated requirements and remove any that are unnecessary before testcases are generated for these requirements.
    - Similarly, you must review test cases and remove any that are unnecessary before they are created on ALM tool.
    - Confirming/deleting the requirements and confirming/deleting the testcases will log the user who did that action.

---

### 📌 Support for Changing Project Requirements
1. As your project requirements change and new features get added and older ones get deprecated, you will be able to create a **new version** of the project in the app.

2. Instead of restarting the whole chain, once you upload the latest revision of the documentation, the app will:

    - Compare new requirements with existing requirements.  
    - Reuse what already exists, deprecate what's unnecessary, and create new ones.
    - Accordingly testcases will also be marked deprectaed/unchanged or new.
    - This will let you generate only what's truly new or changed.

3. Only the **latest version** will allow actions. Older versions will become **read-only**.

---

### 👥 Project Access
1. Multiple team members can work on the same project in this app, as long as they already have the proper access in the ALM tool.  

---

### 🧪 Test Case Lifecycle
1. You will be able to chat with AI and enhance a testcase it generated, if it is not upto the mark, while you are in the confirm testcases state. Once confirmed, test cases are automatically created in the ALM tool.

2. For convenience, this app syncs those testcases right after creation:

    - After creation, they are synced back into this app.
    - Each synced test case provides an **"Open in <ALM Tool Name>"** option for direct navigation.

---

### 📊 Dataset Management
1. Datasets are generated for all confirmed test cases.

    - Trigger dataset creation with the **Create Datasets** button.  
    - You can download datasets either **individually** (per test case) or **in bulk** (for all test cases).  

---

### 🖥️ User Experience Enhancements
1. A **realtime progress banner** is displayed at the top of the **Project Details** page so you can track the current status.

2. Each project will have a **version**.

    - This is preparation for future **versioning support**, so you can later create new test cases when requirements evolve, without losing historical context.

---

### 🤖 Captain (The In-App Assistant)

1. You can also ask **Captain** itself to perform many tasks for you, such as:  

    - Connecting your Jira account  
    - Connecting an ALM project to this application  
    - Deleting a requirement or test case  
    - Creating datasets
    - Creating new project version
    - Confirming delta analysis
    - Creating requirements and testcases on ALM tool

---

### ❓Help Section

1. You can go to help section and checkout the pieces there on how to use this app.

---

## 🚀 Future Updates on Our Roadmap

### 🔀 Upload Existing Testcases
- You will be able to upload existing testcases, into this app and then generate only the missed test cases.

---

### 🔄 Realtime Sync with ALM Tool
- Any changes you make to test cases in ALM tools (outside the app) will sync back automatically into this app.

---

### 🛠️ More Tool Integrations
- Right now, only Jira is supported.  
- Planned future integrations: **Azure DevOps** and **Polarion**.  

---

### 🔐 Authentication
- At this time, only **Google authentication** is supported. More authentication options will be added in the future.

---

You'll see support for uploading already created test cases, realtime sync with ALM tools, and expanded integrations in the near future.

Stay tuned 🚀.