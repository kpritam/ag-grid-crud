# AgGrid CRUD

This project demonstrates the use of AG Grid with Angular for managing employee data. The application supports adding, editing, and deleting employees and their skills, with server-side pagination and data management. It also uses the server-side row model with a master-detail table.

## 📹 Demo

Watch the following demo video to see the application in action:

[AG GRID CRUD DEMO](https://github.com/user-attachments/assets/cc50f7c1-9670-46e3-b652-774fcc2f4028)

## ✨ Features

- ✅ **Employee Management**
- ✅ **Skill Management**
- ✅ **Server-Side Pagination**
- ✅ **Data Persistence**
- ✅ **Master-Detail Table**
- ✅ **Server-Side Row Model**
- ✅ **Add Row**
- ✅ **Delete Row**
- ✅ **Delete Nested Row**
- [ ] **Sorting**
- [ ] **Filtering**
- [ ] **Editing Rows**
- [ ] **Partial Highlight Rows (When some of the skills are deleted)**
- [ ] **Pinning Deleted and Newly Added Rows (Wishlist)**

## 🌿 Branches

### Main Branch

The `main` branch extends the functionality of the `client-side` branch to include server-side data management, including:

- Server-side pagination.
- Integration with a mock backend server for data fetching and updates.
- Server-side row model with master-detail table.

### Client-Side Branch

The `client-side` branch contains the core functionality of the application, including:

- Displaying employee data in an AG Grid table.
- Adding new employees.
- Editing existing employees.
- Deleting employees.
- Managing employee skills.
- Client-side data management.

## 🚀 Development Server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## 🛠️ Building

To build the project, run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## 📚 Additional Resources

For more information on using AG Grid with Angular, visit the [AG Grid Documentation](https://www.ag-grid.com/documentation/).

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
