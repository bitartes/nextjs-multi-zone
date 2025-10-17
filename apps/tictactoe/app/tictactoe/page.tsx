"use client";
/* eslint-disable */
import React, { useMemo, useState } from "react";
import { Link } from "@vercel/microfrontends/next/client";

type Player = "X" | "O";
type Cell = Player | "";
type Board = Cell[];
type Score = { X: number; O: number; draws: number };

const lines: [number, number, number][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function calculateWinner(board: Board): Player | null {
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a] as Player;
    }
  }
  return null;
}

export default function TicTacToePage() {
  const [board, setBoard] = useState<Board>(Array<Cell>(9).fill(""));
  const [xIsNext, setXIsNext] = useState<boolean>(true);
  const [scores, setScores] = useState<Score>({ X: 0, O: 0, draws: 0 });

  const winner: Player | null = useMemo(() => calculateWinner(board), [board]);
  const isDraw: boolean = useMemo(
    () => board.every((v: Cell) => v !== "") && !winner,
    [board, winner]
  );
  const nextPlayer: Player = xIsNext ? "X" : "O";

  function handleClick(i: number) {
    if (board[i] || winner) return;
    const next = board.slice();
    next[i] = nextPlayer;
    setBoard(next);
    setXIsNext(!xIsNext);
  }

  function newRound() {
    const w: Player | null = calculateWinner(board);
    setScores((s: Score) => ({
      X: w === "X" ? s.X + 1 : s.X,
      O: w === "O" ? s.O + 1 : s.O,
      draws: !w && board.every((v: Cell) => v !== "") ? s.draws + 1 : s.draws,
    }));
    setBoard(Array<Cell>(9).fill(""));
    setXIsNext(true);
  }

  function resetAll() {
    setBoard(Array<Cell>(9).fill(""));
    setXIsNext(true);
    setScores({ X: 0, O: 0, draws: 0 });
  }

  return (
    <div className="min-h-screen px-8 py-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-semibold bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--secondary))] bg-clip-text text-transparent">
          Tic Tac Toe
        </h1>
        <p className="mt-3 text-muted-foreground">Minimal neon board with smooth transitions.</p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 md:gap-10 items-start">
          {/* Board */}
          <div>
            <div className="grid grid-cols-3 gap-3 w-[280px] sm:w-[320px] md:w-[360px]">
              {board.map((value: Cell, i: number) => (
                <button
                  key={i}
                  className="aspect-square rounded-lg border border-border bg-card text-foreground text-3xl font-bold flex items-center justify-center transition-colors duration-200 hover:bg-muted ring-1 ring-transparent hover:ring-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => handleClick(i)}
                  disabled={!!value || !!winner}
                >
                  <span
                    className={
                      value === "X"
                        ? "text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.6)]"
                        : value === "O"
                        ? "text-secondary drop-shadow-[0_0_6px_hsl(var(--secondary)/0.6)]"
                        : ""
                    }
                  >
                    {value}
                  </span>
                </button>
              ))}
            </div>

            {/* Status */}
            <div className="mt-6">
              {winner ? (
                <div className="inline-flex items-center gap-2 rounded-md bg-card/60 border border-border px-4 py-2">
                  <span className="text-sm text-muted-foreground">Winner</span>
                  <span className="text-lg font-semibold">{winner}</span>
                </div>
              ) : isDraw ? (
                <div className="inline-flex items-center gap-2 rounded-md bg-card/60 border border-border px-4 py-2">
                  <span className="text-sm text-muted-foreground">Result</span>
                  <span className="text-lg font-semibold">Draw</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-md bg-card/60 border border-border px-4 py-2">
                  <span className="text-sm text-muted-foreground">Next</span>
                  <span className="text-lg font-semibold">{nextPlayer}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-3">
              <button
                onClick={newRound}
                className="px-4 py-2 text-sm rounded-md bg-card border border-border hover:bg-muted transition ring-1 ring-transparent hover:ring-accent"
              >
                New Round
              </button>
              <button
                onClick={resetAll}
                className="px-4 py-2 text-sm rounded-md bg-card border border-border hover:bg-muted transition ring-1 ring-transparent hover:ring-secondary"
              >
                Reset All
              </button>
            </div>
          </div>

          {/* Scoreboard */}
          <div className="rounded-xl border border-border bg-card/60 p-5 w-full md:w-[260px]">
            <h2 className="text-lg font-semibold">Scoreboard</h2>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">X wins</span>
                <span className="text-base font-semibold text-primary">{scores.X}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">O wins</span>
                <span className="text-base font-semibold text-secondary">{scores.O}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Draws</span>
                <span className="text-base font-semibold">{scores.draws}</span>
              </div>
            </div>
            <div className="mt-5">
              <Link className="text-primary hover:opacity-80" href="/">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}