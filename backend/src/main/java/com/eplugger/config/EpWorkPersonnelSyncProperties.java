package com.eplugger.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.epwork-personnel-sync")
public class EpWorkPersonnelSyncProperties {

    private boolean enabled = false;
    private String fullCron = "0 0 * * * *";
    private String table = "BIZ_PERSON";
    private String updateTimeColumn = "UPDATE_TIME";
    private String cursorKey = "BIZ_PERSON";

    /** BIZ_PERSON 表别名 */
    private String personTableAlias = "bp";
    /** BIZ_PERSON.ID → User.id */
    private String personIdColumn = "ID";
    /** BIZ_PERSON.USER_ID → User.ssoId */
    private String personSsoIdColumn = "USER_ID";
    private String personNameColumn = "NAME";
    /** 与 wx_member 关联（常为 user_id） */
    private String personUserIdColumn = "user_id";
    /** 与 wx_department.DEPARTMENT_ID 关联 */
    private String personDepartmentColumn = "DEPARTMENT";
    private String personWorkStatusColumn = "WORK_STATUS";

    private String wxMemberTable = "wx_member";
    private String wxMemberAlias = "wm";
    private String wxMemberUserIdColumn = "user_id";
    private String wxMemberAvatarColumn = "AVATAR";
    private String wxMemberPositionColumn = "POSITION";
    private String wxMemberMobileColumn = "MOBILE";

    private String wxDepartmentTable = "wx_department";
    private String wxDepartmentAlias = "wd";
    private String wxDepartmentIdColumn = "DEPARTMENT_ID";
    private String wxDepartmentNameColumn = "NAME";

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getFullCron() {
        return fullCron;
    }

    public void setFullCron(String fullCron) {
        this.fullCron = fullCron;
    }

    public String getTable() {
        return table;
    }

    public void setTable(String table) {
        this.table = table;
    }

    public String getUpdateTimeColumn() {
        return updateTimeColumn;
    }

    public void setUpdateTimeColumn(String updateTimeColumn) {
        this.updateTimeColumn = updateTimeColumn;
    }

    public String getCursorKey() {
        return cursorKey;
    }

    public void setCursorKey(String cursorKey) {
        this.cursorKey = cursorKey;
    }

    public String getPersonTableAlias() {
        return personTableAlias;
    }

    public void setPersonTableAlias(String personTableAlias) {
        this.personTableAlias = personTableAlias;
    }

    public String getPersonIdColumn() {
        return personIdColumn;
    }

    public void setPersonIdColumn(String personIdColumn) {
        this.personIdColumn = personIdColumn;
    }

    public String getPersonSsoIdColumn() {
        return personSsoIdColumn;
    }

    public void setPersonSsoIdColumn(String personSsoIdColumn) {
        this.personSsoIdColumn = personSsoIdColumn;
    }

    public String getPersonNameColumn() {
        return personNameColumn;
    }

    public void setPersonNameColumn(String personNameColumn) {
        this.personNameColumn = personNameColumn;
    }

    public String getPersonUserIdColumn() {
        return personUserIdColumn;
    }

    public void setPersonUserIdColumn(String personUserIdColumn) {
        this.personUserIdColumn = personUserIdColumn;
    }

    public String getPersonDepartmentColumn() {
        return personDepartmentColumn;
    }

    public void setPersonDepartmentColumn(String personDepartmentColumn) {
        this.personDepartmentColumn = personDepartmentColumn;
    }

    public String getPersonWorkStatusColumn() {
        return personWorkStatusColumn;
    }

    public void setPersonWorkStatusColumn(String personWorkStatusColumn) {
        this.personWorkStatusColumn = personWorkStatusColumn;
    }

    public String getWxMemberTable() {
        return wxMemberTable;
    }

    public void setWxMemberTable(String wxMemberTable) {
        this.wxMemberTable = wxMemberTable;
    }

    public String getWxMemberAlias() {
        return wxMemberAlias;
    }

    public void setWxMemberAlias(String wxMemberAlias) {
        this.wxMemberAlias = wxMemberAlias;
    }

    public String getWxMemberUserIdColumn() {
        return wxMemberUserIdColumn;
    }

    public void setWxMemberUserIdColumn(String wxMemberUserIdColumn) {
        this.wxMemberUserIdColumn = wxMemberUserIdColumn;
    }

    public String getWxMemberAvatarColumn() {
        return wxMemberAvatarColumn;
    }

    public void setWxMemberAvatarColumn(String wxMemberAvatarColumn) {
        this.wxMemberAvatarColumn = wxMemberAvatarColumn;
    }

    public String getWxMemberPositionColumn() {
        return wxMemberPositionColumn;
    }

    public void setWxMemberPositionColumn(String wxMemberPositionColumn) {
        this.wxMemberPositionColumn = wxMemberPositionColumn;
    }

    public String getWxMemberMobileColumn() {
        return wxMemberMobileColumn;
    }

    public void setWxMemberMobileColumn(String wxMemberMobileColumn) {
        this.wxMemberMobileColumn = wxMemberMobileColumn;
    }

    public String getWxDepartmentTable() {
        return wxDepartmentTable;
    }

    public void setWxDepartmentTable(String wxDepartmentTable) {
        this.wxDepartmentTable = wxDepartmentTable;
    }

    public String getWxDepartmentAlias() {
        return wxDepartmentAlias;
    }

    public void setWxDepartmentAlias(String wxDepartmentAlias) {
        this.wxDepartmentAlias = wxDepartmentAlias;
    }

    public String getWxDepartmentIdColumn() {
        return wxDepartmentIdColumn;
    }

    public void setWxDepartmentIdColumn(String wxDepartmentIdColumn) {
        this.wxDepartmentIdColumn = wxDepartmentIdColumn;
    }

    public String getWxDepartmentNameColumn() {
        return wxDepartmentNameColumn;
    }

    public void setWxDepartmentNameColumn(String wxDepartmentNameColumn) {
        this.wxDepartmentNameColumn = wxDepartmentNameColumn;
    }
}
