"""LangGraph agent that tags an asset based on its filename and metadata."""

from langgraph.graph import StateGraph, END
from typing import TypedDict


class AssetState(TypedDict):
    filename: str
    processed_name: str
    tags: list[str]


def classify_node(state: AssetState) -> AssetState:
    name = state["filename"].lower()

    if any(kw in name for kw in ("car", "truck", "plane", "ship", "bike", "vehicle")):
        tags = ["vehicle"]
    elif any(kw in name for kw in ("man", "woman", "person", "character", "human")):
        tags = ["character"]
    else:
        tags = ["prop"]

    return {**state, "tags": tags}


def build_tagger() -> StateGraph:
    builder = StateGraph(AssetState)
    builder.add_node("classify", classify_node)
    builder.set_entry_point("classify")
    builder.add_edge("classify", END)
    return builder.compile()


_tagger = build_tagger()


def tag_asset(filename: str, processed_name: str) -> list[str]:
    result = _tagger.invoke({
        "filename": filename,
        "processed_name": processed_name,
        "tags": [],
    })
    return result["tags"]
