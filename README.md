# AgGridDemo

This project demonstrates the use of AG Grid with Angular for managing employee data. The application supports adding, editing, and deleting employees and their skills, with server-side pagination and data management. It also uses the server-side row model with a master-detail table.

## Demo

[![AG GRID CRUD DEMO]]([https://youtu.be/vt5fpE0bzSY](https://github.com/user-attachments/assets/cc50f7c1-9670-46e3-b652-774fcc2f4028)

## Branches

### Main Branch

The `main` branch contains the core functionality of the application, including:

- Displaying employee data in an AG Grid table.
- Adding new employees.
- Editing existing employees.
- Deleting employees.
- Managing employee skills.
- Client-side data management.

### Server-Side Branch

The `server-side` branch extends the functionality of the `main` branch to include server-side data management, including:

- Server-side pagination.
- Integration with a fake backend server for data fetching and updates.
- Server-side row model with master-detail table.

## Development Server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Building

To build the project, run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Features

- **Employee Management**: Add, edit, and delete employees.
- **Skill Management**: Add, edit, and delete skills for each employee.
- **Server-Side Pagination**: Efficiently handle large datasets with server-side pagination.
- **Data Persistence**: Placeholder to save changes to persistent backend databse.
- **Master-Detail Table**: Display detailed information for each employee using a master-detail table.
- **Server-Side Row Model**: Efficiently manage large datasets with server-side data fetching and updates.
