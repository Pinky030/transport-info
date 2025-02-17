import dayjs from "dayjs";


export const parsedDate = (date) => {
    return dayjs(new Date(date)).format("YYYY-MM-DD HH:mm:ss")
}