package com.eplugger.web.dto;

/**
 * 话题 DTO，与前端 Topic 对齐。
 */
public class TopicDto {

    private String id;
    private String name;
    private int postCount;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getPostCount() { return postCount; }
    public void setPostCount(int postCount) { this.postCount = postCount; }
}
