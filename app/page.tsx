// The URL / has to be served from this file; the page itself lives in home/pages.
export { default } from '@/home/pages/page';

// New arrivals and categories come from the database, so refresh the page every minute.
export const revalidate = 60;
