import Link from "next/link";

export const metadata = {
    title: 'Home'
};

export const API_URL = 'https://nomad-movies.nomadcoders.workers.dev/movies';
async function getMovies() {
    await new Promise((resolve) => setTimeout(resolve, 1000)) // 데이터 요청에 5초가 걸림을 가정
    const response = await fetch(API_URL); // 백엔드에서 미리 실행, 캐싱함
    const json = await response.json();
    return json;
}

export default async function HomePage() {
    const movies = await getMovies();
    // movies.map((movie) => {
    //     console.log(typeof movie.id, typeof movie.title)
    // })
    return (
        <div>
            {movies.map((movie) => {
                return (
                    <li key={movie.id}>
                        <Link href={`/movies/${movie.id}`}>
                            {movie.title}
                        </Link>
                    </li>
                )
            })}
        </div>
    );
}

/*
간단히
const html = await HomPage()
isLoading ? <Loading/> : html
*/