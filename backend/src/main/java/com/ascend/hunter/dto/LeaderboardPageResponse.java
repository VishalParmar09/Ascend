package com.ascend.hunter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data 
@Builder 
@NoArgsConstructor 
@AllArgsConstructor 
public class LeaderboardPageResponse {
    private List<LeaderboardEntryDto> entries;
    private int currentPage;
    private int totalPages;
    private long totalHunters;
    private Long myRankPosition;
}
