package com.java.bank.service;


import com.baomidou.mybatisplus.extension.service.IService;
import com.java.bank.entity.ExamRecord;
import com.java.bank.utils.PageResponse;
import com.java.bank.vo.RecordVo;

import javax.servlet.http.HttpServletRequest;

public interface ExamRecordService extends IService<ExamRecord> {

    PageResponse<ExamRecord> getUserGrade(String username, Integer examId, Integer pageNo, Integer pageSize);

    ExamRecord getExamRecordById(Integer recordId);

    Integer addExamRecord(ExamRecord examRecord, HttpServletRequest request);

    PageResponse<ExamRecord> getExamRecord(RecordVo recordVo);

    void setObjectQuestionScore(Integer totalScore, Integer examRecordId);
}
