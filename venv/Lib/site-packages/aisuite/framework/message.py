"""Interface to hold contents of api responses when they do not conform to the OpenAI style response"""


class Message:
    def __init__(self):
        self.content = None
