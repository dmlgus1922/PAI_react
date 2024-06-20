import '../../styles/GPTStream.css';
import ChatCompo from "@/components/ChatCompo";


export default async function Home() {
  await new Promise((resolve) => setTimeout(resolve, 1000)) // 데이터 요청에 5초가 걸림을 가정

  return (
    <ChatCompo />
  );
}