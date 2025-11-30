import React, { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network';
import type { Node, Edge, Options } from 'vis-network';

const GraphView: React.FC = () => {
  const graphRef = useRef<HTMLDivElement | null>(null);
  const networkRef = useRef<Network | null>(null);
  const [data, setData] = useState<any>(null);

  const API_URL = 'http://localhost:3000/repo/123/graph';

  useEffect(() => {
    const load = async () => {
      const res = await fetch(API_URL);
      const json = await res.json();
      console.log('Loaded graph:', json);
      setData(json);
    };
    load();
  }, []);

  useEffect(() => {
    if (!data || !graphRef.current) return;

    // Give time for DOM to compute layout
    requestAnimationFrame(() => {
      console.log('Initializing vis-network…');

      const colors: Record<string, string> = {
        File: '#1e88e5',
        Commit: '#43a047',
        Contributor: '#fb8c00',
        Issue: '#8e24aa',
        PR: '#e53935',
      };

      const visNodes: Node[] = data.nodes.map((n: any) => ({
        id: n.id,
        label: `${n.label}\n(${n.type})`,
        shape: 'dot',
        size: 20,
        color: colors[n.type] || '#777',
        font: { color: 'white', size: 16 },
        data: n,
      }));

      const visEdges: Edge[] = data.edges.map((e: any) => ({
        from: e.from,
        to: e.to,
        arrows: 'to',
        label: e.type,
        font: { color: 'white', size: 12 },
        color: '#aaa',
      }));

      const options: Options = {
        physics: {
          enabled: true,
          barnesHut: { gravitationalConstant: -5000, springLength: 200 },
        },
        interaction: {
          hover: true,
          zoomView: true,
          dragNodes: true,
        },
      };

      networkRef.current = new Network(
        graphRef.current!,
        { nodes: visNodes, edges: visEdges },
        options,
      );
    });
  }, [data]);

  if (!data) return <p style={{ color: 'white' }}>Loading graph...</p>;

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f172a' }}>
      <div
        ref={graphRef}
        style={{
          flex: 3,
          height: '100vh',
          minHeight: '100vh',
          width: '100%',
          background: '#0f172a',
        }}
      />
      <div
        style={{
          flex: 0.1,
          padding: 20,
          background: '#1e293b',
          color: 'white',
        }}
      >
        <h2>Node Details</h2>
        <p>Select a node</p>
      </div>
    </div>
  );
};

export default GraphView;
