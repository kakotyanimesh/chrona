export function getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    // Local YYYY-MM-DD (avoids UTC offset issues from toISOString)
    return `${year}-${month}-${day}`;
}
