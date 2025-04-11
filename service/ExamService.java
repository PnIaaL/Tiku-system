package com.java.bank.service;


import com.baomidou.mybatisplus.extension.service.IService;
import com.java.bank.entity.Exam;
import com.java.bank.utils.PageResponse;
import com.java.bank.vo.AddExamByQuestionVo;
import com.java.bank.vo.AddSmartExamVo;
import com.java.bank.vo.ExamQueryVo;

public interface ExamService extends IService<Exam> {

    PageResponse<Exam> getExamPage(ExamQueryVo examQueryVo);

    AddExamByQuestionVo getExamInfoById(Integer examId);

    void operationExam(Integer type, String ids);

    void addExamBySmart(AddSmartExamVo addSmartExamVo);

    void addExamByQuestionList(AddExamByQuestionVo addExamByQuestionVo);

    void updateExamInfo(AddExamByQuestionVo addExamByQuestionVo);

    String getQuestionIdsByExamId(Integer examId);
}
