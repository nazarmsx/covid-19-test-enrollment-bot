import { endOfDay } from 'date-fns'

export function addRangeToQuery(to: string | Date, from: string, query: any, filterField: string) {
    if (to) {
        to = endOfDay(new Date(to))
    }

    if (to && from) {
        query[filterField] = {$gte: from, $lt: to}
    }
    if (to && !from) {
        query[filterField] = {$lt: to}
    }
    if (!to && from) {
        query[filterField] = {$gte: from}
    }
}