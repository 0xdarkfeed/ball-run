// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Leaderboard
 * @dev Simple leaderboard contract for Ball Run game scores
 * Stores player scores on Base network with sponsor gas
 */
contract Leaderboard {
    struct Score {
        address player;
        uint256 level;
        uint256 balls;
        uint256 bosses;
        uint256 timestamp;
    }

    // Mapping from player address to their best score
    mapping(address => Score) public playerScores;
    
    // Array of all scores for leaderboard (top 100)
    Score[] public topScores;
    
    // Events
    event ScoreSubmitted(
        address indexed player,
        uint256 level,
        uint256 balls,
        uint256 bosses,
        uint256 timestamp
    );

    /**
     * @dev Submit a new score
     * @param level The level reached
     * @param balls The number of balls achieved
     * @param bosses The number of bosses defeated
     */
    function submitScore(
        uint256 level,
        uint256 balls,
        uint256 bosses
    ) external {
        Score memory newScore = Score({
            player: msg.sender,
            level: level,
            balls: balls,
            bosses: bosses,
            timestamp: block.timestamp
        });

        // Check if this is a new best score for the player
        Score memory currentBest = playerScores[msg.sender];
        
        // Update if new score is better (higher level, or same level with more balls/bosses)
        bool isBetter = 
            level > currentBest.level ||
            (level == currentBest.level && balls > currentBest.balls) ||
            (level == currentBest.level && balls == currentBest.balls && bosses > currentBest.bosses);

        if (isBetter || currentBest.timestamp == 0) {
            playerScores[msg.sender] = newScore;
            
            // Add to top scores if it's in top 100
            _updateTopScores(newScore);
            
            emit ScoreSubmitted(msg.sender, level, balls, bosses, block.timestamp);
        }
    }

    /**
     * @dev Get player's best score
     * @param player The player address
     * @return The player's best score
     */
    function getPlayerScore(address player) external view returns (Score memory) {
        return playerScores[player];
    }

    /**
     * @dev Get top N scores
     * @param count Number of top scores to return
     * @return Array of top scores
     */
    function getTopScores(uint256 count) external view returns (Score[] memory) {
        uint256 length = topScores.length < count ? topScores.length : count;
        Score[] memory result = new Score[](length);
        
        for (uint256 i = 0; i < length; i++) {
            result[i] = topScores[i];
        }
        
        return result;
    }

    /**
     * @dev Get total number of scores
     * @return Total count
     */
    function getScoreCount() external view returns (uint256) {
        return topScores.length;
    }

    /**
     * @dev Internal function to update top scores
     * @param newScore The new score to potentially add
     */
    function _updateTopScores(Score memory newScore) internal {
        // Simple insertion: add if less than 100, or replace worst if better
        if (topScores.length < 100) {
            topScores.push(newScore);
        } else {
            // Find worst score
            uint256 worstIndex = 0;
            for (uint256 i = 1; i < topScores.length; i++) {
                if (_isWorse(topScores[i], topScores[worstIndex])) {
                    worstIndex = i;
                }
            }
            
            // Replace worst if new score is better
            if (_isBetter(newScore, topScores[worstIndex])) {
                topScores[worstIndex] = newScore;
            }
        }
        
        // Sort top scores (simple bubble sort for small array)
        _sortTopScores();
    }

    /**
     * @dev Check if score1 is better than score2
     */
    function _isBetter(Score memory score1, Score memory score2) internal pure returns (bool) {
        if (score1.level > score2.level) return true;
        if (score1.level < score2.level) return false;
        if (score1.balls > score2.balls) return true;
        if (score1.balls < score2.balls) return false;
        return score1.bosses > score2.bosses;
    }

    /**
     * @dev Check if score1 is worse than score2
     */
    function _isWorse(Score memory score1, Score memory score2) internal pure returns (bool) {
        return _isBetter(score2, score1);
    }

    /**
     * @dev Sort top scores array (bubble sort)
     */
    function _sortTopScores() internal {
        for (uint256 i = 0; i < topScores.length; i++) {
            for (uint256 j = 0; j < topScores.length - i - 1; j++) {
                if (_isWorse(topScores[j], topScores[j + 1])) {
                    Score memory temp = topScores[j];
                    topScores[j] = topScores[j + 1];
                    topScores[j + 1] = temp;
                }
            }
        }
    }
}

