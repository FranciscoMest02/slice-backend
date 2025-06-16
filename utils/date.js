export default function todayString() {
    return new Date().toISOString().split('T')[0]
}

export function yesterdayString() {
    const now = new Date();
    now.setUTCDate(now.getUTCDate() - 1);
    return now.toISOString().split('T')[0];
}