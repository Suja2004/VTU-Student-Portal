const API_URL = "/vtu/api/v1";

export function handleLogout() {
    localStorage.clear();
    window.location.href = "/";
}

export async function getSkills() {
    const response = await fetch(`${API_URL}/master/skills`);

    if (response.status === 401) {
        handleLogout();
        throw new Error("Session expired");
    }

    if (!response.ok) throw new Error("Failed to fetch skills");
    return response.json();
}


export async function getStudentDetails() {
    const response = await fetch(`${API_URL}/student/detail`);

    if (response.status === 401) {
        handleLogout();
        throw new Error("Session expired");
    }

    if (!response.ok) throw new Error("Failed to fetch student details");
    return response.json();
}

export async function getStudentProjectDetails() {
    const response = await fetch(`${API_URL}/student/projects/my-project`);

    if (response.status === 401) {
        handleLogout();
        throw new Error("Session expired");
    }

    if (!response.ok) throw new Error("Failed to fetch project details");
    return response.json();
}

export async function getStudentInternshipDetails() {
    const response = await fetch(`${API_URL}/student/internship-applys?status=6`);

    if (response.status === 401) {
        handleLogout();
        throw new Error("Session expired");
    }

    if (!response.ok) throw new Error("Failed to fetch project details");
    return response.json();
}

export async function getStudentDiary(dairy_type) {
    const response = await fetch(`${API_URL}/student/${dairy_type}`);

    if (response.status === 401) {
        handleLogout();
        throw new Error("Session expired");
    }

    if (!response.ok) throw new Error("Failed to fetch diary");
    return response.json();
}


export async function getDiaryByID(id, dairy_type) {
    const response = await fetch(`${API_URL}/student/${dairy_type}/show?id=${id}`);

    if (response.status === 401) {
        handleLogout();
        throw new Error("Session expired");
    }

    if (!response.ok) throw new Error("Failed to fetch diary");
    return response.json();
}


export async function createDiary(type, data) {
    const response = await fetch(`${API_URL}/student/${type}-diaries/store`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify(data)
    });

    if (response.status === 401) {
        handleLogout();
        throw new Error("Session expired");
    }

    if (!response.ok) throw new Error("Failed to create diary");

    return response.json();
}