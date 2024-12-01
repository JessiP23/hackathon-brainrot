from aisuite.provider import Provider


class GcpProvider(Provider):
    def __init__(self) -> None:
        pass

    def chat_completions_create(self, model, messages):
        raise ValueError("GCP Provider not yet implemented.")
