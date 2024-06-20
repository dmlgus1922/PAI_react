import asyncio
import websockets
import json
import requests
import queue

class CompletionExecutor:
    def __init__(self, host, api_key, api_key_primary_val,
                #   request_id
                  ):
        self._host = host
        self._api_key = api_key
        self._api_key_primary_val = api_key_primary_val
        self.answer = ''
        # self._request_id = request_id
 
    def execute(self, completion_request, response_type="stream"):
        global q
        headers = {
            "X-NCP-CLOVASTUDIO-API-KEY": self._api_key,
            "X-NCP-APIGW-API-KEY": self._api_key_primary_val,
            # "X-NCP-CLOVASTUDIO-REQUEST-ID": self._request_id,
            "Content-Type": "application/json; charset=utf-8",
            "Accept": "text/event-stream"
        }
 
        final_answer = ""
 
        with requests.post(
            self._host + "/testapp/v1/chat-completions/HCX-003",
            headers=headers,
            json=completion_request,
            stream=True
        ) as r:
            if response_type == "stream":
                longest_line = ""
                for line in r.iter_lines():
                    if line:
                        decoded_line = line.decode("utf-8")
                        if decoded_line.startswith("data:"):
                            event_data = json.loads(decoded_line[len("data:"):])
                            message_content = event_data.get("message", {}).get("content", "")
                            if len(message_content) > len(longest_line):
                                longest_line = message_content
                            # print(longest_line)
                            # return message_content
                            q.put(message_content)
                            # self.return_answer()
                final_answer = longest_line
            elif response_type == "single":
                final_answer = r.json()  # 가정: 단일 응답이 JSON 형태로 반환됨
            # self.answer = 'finished'
            # return self.answer
            q.put('<finish>')
        
    def return_answer(self):
        return self.answer

q = queue.Queue()
q.put('<start>')

async def handler(websocket, path):
    global q
    completion_executor = CompletionExecutor(
        host="https://clovastudio.stream.ntruss.com",
        api_key='',
        api_key_primary_val='',
    )
    recv_data = await websocket.recv()
    print(recv_data)
    json_data = json.loads(recv_data)
    messages = json_data['msgs']
    request_data = {
        "messages": messages,
        "topP": 0.6,
        "topK": 0,
        "maxTokens": 1024,
        "temperature": 0.5,
        "repeatPenalty": 1.2,
        "stopBefore": [],
        "includeAiFilters": False
    }
    completion_executor.execute(request_data)
    q_data = q.get()
    while q_data != '<finish>':
        print(q_data)
        if q_data == '<finish>':
            await websocket.send('hcx finished')
        elif q_data != '<start>' and q_data:
            await websocket.send(q_data)
        q_data = q.get()
    send_message = "예시 문장입니다"
    # await websocket.send(response_data)

if __name__ == '__main__':
    start_server = websockets.serve(handler, 'localhost', 9999)

    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()
