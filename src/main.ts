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
    ['Vicky', 'Prasobetan', 'Appidi', 'Abhi', 'Ansil', 'Deepthan', 'Manikutan', 'Nandu', 'Kuttu'].forEach(n => this.addPlayer(n));
  }

  get pairCount() { return this.pairs.length; }
  get requiredPairCount() { return this.players.length / 2; }
  get allPlayersPaired() { return this.players.length > 0 && this.players.length % 2 === 0 && this.pairs.length === this.requiredPairCount; }
  get canGenerate() {
    return this.players.length >= 2;
  } get unpairedPlayers() {
    const used = new Set(this.pairs.flatMap(p => [p.a, p.b]));
    return this.players.filter(p => !used.has(p.id));
  }
  get availablePlayersForFirstDropdown(): Player[] {
  return this.unpairedPlayers.filter(
    player => player.id !== this.selectedB
  );
}

get availablePlayersForSecondDropdown(): Player[] {
  return this.unpairedPlayers.filter(
    player => player.id !== this.selectedA
  );
}

  addPlayer(name = this.newPlayer) {
    const clean = name.trim();
    if (!clean) return;
    if (this.players.some(p => p.name.toLowerCase() === clean.toLowerCase())) { this.error = 'That player is already added.'; return; }
    const id = this.players.length ? Math.max(...this.players.map(p => p.id)) + 1 : 1;
    this.players.push({ id, name: clean, initials: clean.split(/\s+/).map(x => x[0]).join('').slice(0, 2).toUpperCase() });
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
    this.pairs.push({ a: this.selectedA, b: this.selectedB });
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

    if (this.players.length < 2) {
      this.error = 'Add at least 2 players.';
      return;
    }

    const teamA: Player[] = [];
    const teamB: Player[] = [];

    // Track players who are already part of a pair
    const pairedPlayerIds = new Set<number>();

    // 1. Randomly split every pair
    for (const pair of this.pairs) {
      const playerA = this.player(pair.a);
      const playerB = this.player(pair.b);

      pairedPlayerIds.add(pair.a);
      pairedPlayerIds.add(pair.b);

      // Randomly decide which player goes to which team
      if (Math.random() < 0.5) {
        teamA.push(playerA);
        teamB.push(playerB);
      } else {
        teamA.push(playerB);
        teamB.push(playerA);
      }
    }

    // 2. Find players who don't have a pair
    const unpairedPlayers = this.players.filter(
      player => !pairedPlayerIds.has(player.id)
    );


    // 3. Randomize unpaired players
    const shuffledUnpaired = [...unpairedPlayers].sort(
      () => Math.random() - 0.5
    );

    // 4. Randomly decide which team gets the extra player
    //    when the total number of players is odd.
    const extraPlayerToTeamA =
      this.players.length % 2 === 1
        ? Math.random() < 0.5
        : true;

    // Target sizes
    const totalPlayers = this.players.length;
    const teamASize = Math.floor(totalPlayers / 2) +
      (totalPlayers % 2 === 1 && extraPlayerToTeamA ? 1 : 0);

    const teamBSize = totalPlayers - teamASize;

    // 5. Randomly distribute unpaired players
    for (const player of shuffledUnpaired) {
      if (teamA.length < teamASize && teamB.length < teamBSize) {
        // Both teams have room, randomly choose
        if (Math.random() < 0.5) {
          teamA.push(player);
        } else {
          teamB.push(player);
        }
      } else if (teamA.length < teamASize) {
        teamA.push(player);
      } else {
        teamB.push(player);
      }
    }

    // 6. Final assignment
    this.teamA = teamA;
    this.teamB = teamB;
    this.generated = true;
  }

  resetTeams() { this.generated = false; this.teamA = []; this.teamB = []; }

  resetAll() {
    this.pairs = []; this.resetTeams(); this.error = '';
  }
}

bootstrapApplication(AppComponent).catch(err => console.error(err));