package com.java.bank.service;


import com.baomidou.mybatisplus.extension.service.IService;
import com.java.bank.entity.Question;
import com.java.bank.utils.PageResponse;
import com.java.bank.vo.QuestionImportVo;
import com.java.bank.vo.QuestionQueryVo;
import com.java.bank.vo.QuestionVo;

import java.util.List;

public interface QuestionService extends IService<Question> {

    PageResponse<Question> getQuestion(QuestionQueryVo queryVo);

    QuestionVo getQuestionVoById(Integer id);

    PageResponse<QuestionVo> getQuestionVoByIds(List<Integer> ids);

    void deleteQuestionByIds(String questionIds);

    void addQuestion(QuestionVo questionVo);

    void updateQuestion(QuestionVo questionVo);

    void importQuestion(QuestionImportVo questionImportVo);
}
