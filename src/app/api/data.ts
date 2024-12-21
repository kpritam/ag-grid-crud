import { EmployeeData } from "./employee";

export const EMPTY_EMPLOYEE: EmployeeData = {
    EmployeeID: 0,
    FirstName: '',
    LastName: '',
    Department: '',
    Salary: 0,
    Skills: [{ Name: 'Scala', Rating: 5, YearsOfExperience: 3, isNew: false, isDeleted: false }],
    isNew: false,
    isDeleted: false,
};

export const EMPLOYEES: EmployeeData[] = Array.from({ length: 50 }, (_, i) => ({
    EmployeeID: i + 1,
    FirstName: `Employee ${i + 1}`,
    LastName: `Doe`,
    Department: `Engineering`,
    Salary: 60000,
    Skills: [
        { Name: 'Scala', Rating: 5, YearsOfExperience: 3, isNew: false, isDeleted: false },
        { Name: 'Angular', Rating: 4, YearsOfExperience: 2, isNew: false, isDeleted: false },
        { Name: 'GraphDB', Rating: 3, YearsOfExperience: 1, isNew: false, isDeleted: false },
    ],
    isNew: false,
    isDeleted: false,
}));
