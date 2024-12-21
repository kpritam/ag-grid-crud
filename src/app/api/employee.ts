export interface Skill {
    Name: string;
    Rating: number;
    YearsOfExperience: number;
    isNew?: boolean;
    isDeleted?: boolean;
}

export interface EmployeeData {
    EmployeeID: number;
    FirstName: string;
    LastName: string;
    Department: string;
    Salary: number;
    Skills: Skill[];
    isNew?: boolean;
    isDeleted?: boolean;
}
