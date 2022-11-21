import { current_user } from "../user/user_profile.js";
import { axiosWrapper } from "../utils/axios_helper.js";
import { recipe_pagination } from "./search.js";


function recom_recipe() {
  axiosWrapper("GET", "recipes?recommand", null, (res) => {
    console.log("res: ", res);
    const post_ul = $(".posts-box").children(":first");
    post_ul.empty();
    recipe_pagination(post_ul, 0, 20, res.data);
  }, (e) => {
    console.log("e: ", e);
  });
};


// 로그인 여부에 따라 Main Section 전환
export const main_set = (function() {
  const user = current_user();
  const section_top = $("#main-f");
  const section_attach = section_top.children().first();

  recom_recipe();

  if (user) { // 로그인한 상태
    const refrige_html = `<div class="position-relative">
                            <div class="content content-wrapper">
                              <h3>나의 냉장고</h3>
                              <p>요즘 관심 있는 식재료, 나의 냉장고에 저장해보세요</p>
                              <div class="refrige-bg-wrap">
                                <div class="refrige-bg w-100">
                                  <div class="refrige-div">
                                    <div class="ingre-card-wrapper w-100">
                                    </div>          
                                  </div>
                                </div>
                              </div>
                              <div class="refrige-btn">
                                <button type="button" onclick="location.href='/manage?tab=refrige';">재료 등록하러 가기</button>
                              </div>
                            </div>
                          </div>`;
    section_top.attr("id", "refrige"); // id 변경
    section_top.attr("class", "refrige"); // class 변경

    const start_btn = $(".btn-get-started");
    start_btn.attr("href", "#refrige");

    section_attach.append(refrige_html);
  } else { // 비로그인 상태
    const about_html = `<div class="row no-gutters">
                          <div class="content col-xl-5 d-flex align-items-stretch w-100 abt-f" data-aos="fade-up">
                            <div class="content">
                              <h3>쩝쩝박사 사용법을 알아봐요!</h3>
                              <p>쩝쩝박사는 나의 냉장고에 등록된 재료를 기반으로 레시피를 추천해드려요!</p>
                              <a href="login" class="about-btn">시작하기! <i class="bx bx-chevron-right"></i></a>
                            </div>
                            <section id="testimonials" class="testimonials section-bg abt-ttm pt-4 pb-4">
                              <div class="container">
                                <div class="testimonials-slider swiper" data-aos="fade-up" data-aos-delay="100">
                                  <div class="swiper-wrapper">
                                    <div class="swiper-slide">
                                      <div class="testimonial-item">
                                        <p>
                                          <i class="bx bxs-quote-alt-left quote-icon-left"></i>
                                          나의 냉장고에 재료 등록하고!
                                          <i class="bx bxs-quote-alt-right quote-icon-right"></i>
                                        </p>
                                        <img src="assets/img/001-2.png" class="testimonial-img"/>
                                      </div>
                                    </div>
                                    <!-- End testimonial item -->
                                    <div class="swiper-slide">
                                      <div class="testimonial-item">
                                        <p>
                                          <i class="bx bxs-quote-alt-left quote-icon-left"></i>
                                          레시피를 추천받고!
                                          <i class="bx bxs-quote-alt-right quote-icon-right"></i>
                                        </p>
                                        <img src="assets/img/002-1.png" class="testimonial-img"/>
                                      </div>
                                    </div>
                                    <!-- End testimonial item -->
                                    <div class="swiper-slide">
                                      <div class="testimonial-item">
                                        <p>
                                          <i class="bx bxs-quote-alt-left quote-icon-left"></i>
                                          나만의 레시피도 자랑해보세요!
                                          <i class="bx bxs-quote-alt-right quote-icon-right"></i>
                                        </p>
                                        <img src="assets/img/003-1.png" class="testimonial-img"/>
                                      </div>
                                    </div>
                                    <!-- End testimonial item -->
                                  </div>
                                  <div class="swiper-pagination"></div>
                                </div>
                              </div>
                            </section>
                            <!-- End Testimonials Section -->
                          </div>
                        </div>`;
    section_top.attr("id", "about"); // id 변경
    section_attach.append(about_html);
  }
}());