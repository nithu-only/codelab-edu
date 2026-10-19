package com.codelab.workspace;

public class FileInfo {
    private String path;
    private String type; // file or dir
    private long size;
    private long modified;

    public FileInfo() {}

    public FileInfo(String path, String type, long size, long modified) {
        this.path = path;
        this.type = type;
        this.size = size;
        this.modified = modified;
    }

    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public long getSize() { return size; }
    public void setSize(long size) { this.size = size; }
    public long getModified() { return modified; }
    public void setModified(long modified) { this.modified = modified; }
}
