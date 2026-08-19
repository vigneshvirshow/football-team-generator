import { bootstrapApplication } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Player { id: number; name: string; initials: string; }
interface Pair { a: number; b: number; }

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './styles.css'
})
export class AppComponent {
  players: Player[] = [];
  pairs: Pair[] = [];
  teamA: Player[] = [];
  teamB: Player[] = [];
  newPlayer = '';
  selectedA: number | null = null;
  selectedB: number | null = null;
  generated = false;
  error = '';

  constructor() {
    ['Vicky','Prasobetan','Appidi','Abhi','Ansil','Deepthan','Manikutan','Nandu','Kuttu'].forEach(n => this.addPlayer(n));
  }

  get pairCount() { return this.pairs.length; }
  get requiredPairCount() { return this.players.length / 2; }
  get allPlayersPaired() { return this.players.length > 0 && this.players.length % 2 === 0 && this.pairs.length === this.requiredPairCount; }
  get canGenerate() { return this.allPlayersPaired; }
  get unpairedPlayers() {
    const used = new Set(this.pairs.flatMap(p => [p.a, p.b]));
    return this.players.filter(p => !used.has(p.id));
  }

  addPlayer(name = this.newPlayer) {
    const clean = name.trim();
    if (!clean) return;
    if (this.players.some(p => p.name.toLowerCase() === clean.toLowerCase())) { this.error = 'That player is already added.'; return; }
    const id = this.players.length ? Math.max(...this.players.map(p => p.id)) + 1 : 1;
    this.players.push({ id, name: clean, initials: clean.split(/\s+/).map(x => x[0]).join('').slice(0,2).toUpperCase() });
    this.newPlayer = '';
    this.error = '';
  }

  removePlayer(id: number) {
    this.players = this.players.filter(p => p.id !== id);
    this.pairs = this.pairs.filter(p => p.a !== id && p.b !== id);
    this.resetTeams();
  }

  createPair() {
    this.error = '';
    if (this.selectedA === null || this.selectedB === null || this.selectedA === this.selectedB) {
      this.error = 'Select two different players to create a pair.'; return;
    }
    if (this.pairs.some(p => p.a === this.selectedA || p.b === this.selectedA || p.a === this.selectedB || p.b === this.selectedB)) {
      this.error = 'One of these players is already paired.'; return;
    }
    this.pairs.push({a: this.selectedA, b: this.selectedB});
    this.selectedA = this.selectedB = null;
    this.resetTeams();
  }

  removePair(pair: Pair) {
    this.pairs = this.pairs.filter(p => p !== pair);
    this.resetTeams();
  }

  player(id: number) { return this.players.find(p => p.id === id)!; }

  generate() {
    this.error = '';
    if (this.players.length < 2 || this.players.length % 2 !== 0) {
      this.error = 'Use an even number of players to generate two equal teams.'; return;
    }
    if (!this.allPlayersPaired) {
      this.error = `Pair all players before generating teams. You have ${this.pairCount} of ${this.requiredPairCount} pairs.`;
      return;
    }
    const half = this.players.length / 2;
    let bestA: Player[] | null = null;
    for (let attempt = 0; attempt < 500; attempt++) {
      const shuffled = [...this.players].sort(() => Math.random() - 0.5);
      const a = shuffled.slice(0, half);
      const ids = new Set(a.map(p => p.id));
      if (this.pairs.every(pair => ids.has(pair.a) !== ids.has(pair.b))) { bestA = a; break; }
    }
    if (!bestA) {
      this.error = 'No valid team split was found. Try removing or changing a pair.';
      return;
    }
    const ids = new Set(bestA.map(p => p.id));
    this.teamA = bestA;
    this.teamB = this.players.filter(p => !ids.has(p.id));
    this.generated = true;
  }

  resetTeams() { this.generated = false; this.teamA = []; this.teamB = []; }

  resetAll() {
    this.players = []; this.pairs = []; this.resetTeams(); this.newPlayer = ''; this.error = '';
  }
}

bootstrapApplication(AppComponent).catch(err => console.error(err));