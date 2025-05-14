export default function todayString() {
    return new Date().toISOString().split('T')[0]
}