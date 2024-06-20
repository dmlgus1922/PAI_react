import '../../styles/GPTStream.css';
import gptLogo from '../../public/images/gpt_logo.png';
import Image from "next/image";
import MarkdownViewer from '@/components/MarkdownViewer';

const GPTWELCOMETEXT = '안녕하세요. 무엇을 도와드릴까요?';

export default function Loading() {

    return (
        <div className="chat-window">
            <div className="messages">
                <div className="message assistant">
                    <Image src={gptLogo} alt="gpt-logo" className="gpt-logo"></Image>
                    <MarkdownViewer markdownText={GPTWELCOMETEXT} />
                </div>
            </div>
            <div className="input-area">
                <textarea rows={1} />
                <button>입력</button>
            </div>
        </div>
    );
}
