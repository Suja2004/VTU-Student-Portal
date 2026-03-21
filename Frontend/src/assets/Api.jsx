const API_URL = "/vtu/api/v1/student";

export function handleLogout() {
    localStorage.clear();
    window.location.href = "/";
}

export async function getStudentDetails() {
    const response = await fetch(`${API_URL}/detail`);

    if (response.status === 401) {
        handleLogout();
        throw new Error("Session expired");
    }

    if (!response.ok) throw new Error("Failed to fetch student details");
    return response.json();
}

export async function getStudentProjectDetails() {
    const response = await fetch(`${API_URL}/projects/my-project`);

    if (response.status === 401) {
        handleLogout();
        throw new Error("Session expired");
    }

    if (!response.ok) throw new Error("Failed to fetch project details");
    return response.json();
}

export async function getStudentInternshipDetails() {
    const response = await fetch(`${API_URL}/internship-applys?status=6`);

    if (response.status === 401) {
        handleLogout();
        throw new Error("Session expired");
    }

    if (!response.ok) throw new Error("Failed to fetch project details");
    return response.json();
}

export async function getStudentDiary(dairy_type) {
    const response = await fetch(`${API_URL}/${dairy_type}`);

    if (response.status === 401) {
        handleLogout();
        throw new Error("Session expired");
    }

    if (!response.ok) throw new Error("Failed to fetch diary");
    return response.json();
}

