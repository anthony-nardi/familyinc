export default function random(min: number, max: number): number {
    return Math.random() * (max - min) + min
}
