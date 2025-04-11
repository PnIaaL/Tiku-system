package com.java.bank.service;


import com.baomidou.mybatisplus.extension.service.IService;
import com.java.bank.entity.Notice;
import com.java.bank.utils.PageResponse;

public interface NoticeService extends IService<Notice> {
    // 将所有公告设置为历史公告
    void setAllNoticeIsHistoryNotice();

    String getCurrentNotice();

    PageResponse<Notice> getAllNotices(String content, Integer pageNo, Integer pageSize);

    void publishNotice(Notice notice);

    void deleteNoticeByIds(String noticeIds);

    void updateNotice(Notice notice);
}
