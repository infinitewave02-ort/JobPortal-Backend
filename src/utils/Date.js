export const getCurrentTimestamp = () => new Date().toISOString();

export const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

export const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString();
};
