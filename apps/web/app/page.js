"use client"
import {useQuery} from "convex/react";
import {api} from "../../../convex/_generated/api";
export default function Home() {
  const items = useQuery(api.items.getItems);
  return (
    <>
    <h1>FlowClip</h1>
    {
      items?.map((item, key)=>(
        <div key={key}>{item.content}</div>
      ))
    }
    </>
  );
}
