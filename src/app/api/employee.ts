
export type RowStatus = 'BeingAdded' | 'New' | 'Deleted' | 'Server';

export interface Skill {
    Name: string;
    Rating: number;
    YearsOfExperience: number;
    status?: RowStatus;
}

export interface EmployeeData {
    EmployeeID: number;
    FirstName: string;
    LastName: string;
    Department: string;
    Salary: number;
    Skills: Skill[];
    status?: RowStatus
}
